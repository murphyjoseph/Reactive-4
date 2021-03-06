import React, { FC } from "react";
import _merge from 'lodash/merge';
import _map from 'lodash/map';
import _isObject from 'lodash/isObject';

import { IField } from './field.interface';
import { IOption } from '../../interfaces/option.interface';
import { fieldKlassInterpreter } from './field.klass-interpreter';
import { PresetField } from './field.presets';
import { Text } from '../text/text'
import { Container } from "../container/container";
import styles from './field.module.scss';

import { KlassInterpreter } from '../../services/KlassInterpreter';
import { capitalizeFirst } from "../../utilities/capitalizeFirst";
import { cat } from "../../utilities/classNames";
import { createNewBindings } from "../../services/Merge";

import { stFlexColYCenter,
         stFlexColAuto1,
         stFlexColPercent100,
         stFlex,
         stFlexWrap,
         utPositionRelative,
         utMarginBottomSize1,
         utMarginRightSize2,
         stFlexColOrderFirst,
         stFlexColOrderLast,
         utMarginLeftSize2 } from "../../styles/application-styles.module.scss";

const Styles = styles as { [key: string]: string };

interface Props {
  passedBindings?: IField;
}

const setTag = (inputType: string) => {
  if (inputType === "textarea") {
    return "textarea";
  } else if (inputType === "select") {
    return "select";
  } else {
    return "input";
  }
}

function normalizeOptions(options: (string | IOption)[], addEmptyOption: boolean) {
  if (addEmptyOption) {
    options.unshift({ name: " ", id: undefined, isDisabled: false } as IOption);
  }

  return _map(options, function(option: (string | IOption)) {
    if (((option instanceof String) || (typeof option == 'string'))) {
      return { id: option, name: option, isDisabled: false } as IOption;
    } else {
      if (Array.isArray(option)) {
        let isDisabled = option[2] || false;
        return { id: option[0], name: option[1], isDisabled: isDisabled } as IOption;
      } else if (_isObject(option)) {
        return { id: option.id, name: option.name, isDisabled: option.isDisabled } as IOption;
      }
    }
  });
}

export const Field: FC<Props> = ({ passedBindings }) => {

  if (!passedBindings) return <></>

  // SET DEFAULTS

  const presetType = !!passedBindings.preset ? passedBindings.preset : "initial"
  const presetBindings = PresetField[presetType]
  const bindings = createNewBindings(presetBindings, passedBindings)

  const klasses = new KlassInterpreter(bindings);
  fieldKlassInterpreter(bindings, klasses);
  const patternKlasses = cat(Styles.fieldWrapper, bindings.className, ...klasses.getKlasses());
  const Tag = setTag(bindings.kind!) as any;
  const displayLabelTextBindings = !!bindings.labelTextBindings && !!bindings.labelTextBindings.text;
  const displaySublabelTextBindings = !!bindings.sublabelTextBindings && !!bindings.sublabelTextBindings.text;
  const isLabelsDisplayed = displayLabelTextBindings || displaySublabelTextBindings;

  if (bindings.kind === "select" && !!bindings.options) {
    if ((bindings.addEmptyOption != false && bindings.addEmptyOption != true)) {
      bindings.addEmptyOption = true;
    }
    bindings.options = normalizeOptions(bindings.options, bindings.addEmptyOption);
  }

  // Set Field Label Position
  let container = stFlexWrap;
  let labelColumn = stFlexColPercent100;
  let inputColumn = stFlexColPercent100;
  let orderColumn = stFlexColOrderFirst;
  let textSpacing = utMarginBottomSize1;

  if (bindings.labelPosition === "left" || bindings.labelPosition === "right") {
    labelColumn = stFlexColAuto1;
    inputColumn = stFlexColAuto1;
    container = "";
    if (bindings.labelPosition === "right") {
      textSpacing = utMarginLeftSize2;
      orderColumn = stFlexColOrderLast;
    } else {
      textSpacing = utMarginRightSize2;
    }
  }

  if (bindings.labelPosition === "top") {
    bindings.isFull = true
  }

  // Set Input
  const isFull = !!bindings.isFull ? styles.fieldInputIsFull : "";

  // Set Input Min-Width & Max-Height
  const KlassMinWidth = !!bindings.minWidth ? Styles[`field-input-min-width-${bindings.minWidth}`] : "";
  const KlassMaxWidth = !!bindings.maxWidth ? Styles[`field-input-max-width-${bindings.maxWidth}`] : "";
  const KlassMinHeight = !!bindings.minHeight ? Styles[`field-input-min-height-${bindings.minHeight}`] : "";
  const KlassMaxHeight = !!bindings.maxHeight ? Styles[`field-input-max-height-${bindings.maxHeight}`] : "";

  const optionalInputAttributes: React.AllHTMLAttributes<HTMLElement> = {};

  if (!!bindings.validation) {
    const validation = bindings.validation();
    if (_isObject(validation)) _merge(optionalInputAttributes, validation)
  };

  if (bindings.kind === "radio" || bindings.kind === "checkbox") optionalInputAttributes.checked = bindings.checked;

  // VIEW

  return (
    <label className={patternKlasses}>
      <div className={cat(stFlex, container)}>
        {
          isLabelsDisplayed &&
          <div className={cat(Styles.fieldText, stFlexColYCenter, orderColumn, labelColumn, textSpacing)}>
            {
              displayLabelTextBindings &&
              <Text passedBindings={bindings.labelTextBindings} />
            }
            {
              displaySublabelTextBindings &&
              <Text passedBindings={bindings.sublabelTextBindings} />
            }
          </div>
        }
        <div className={cat(stFlexColYCenter, inputColumn, utPositionRelative)}>
          <Tag
            className={cat(Styles.fieldInput, KlassMaxHeight, isFull, KlassMinWidth, KlassMaxWidth, KlassMinHeight)}
            type={bindings.kind}
            {...(!!bindings.placeholder ? {placeholder: bindings.placeholder} : {})}
            {...(!!bindings.name ? {name: bindings.name} : {})}
            {...(!!bindings.placeholder ? {placeholder: bindings.placeholder} : {})}
            {...(!!bindings.readonly ? {readonly: true} : {})}
            {...(!!bindings.isDisabled ? {disabled: true} : {})}
            {...(!!bindings.required ? {required: true} : {})}
            {...(!!bindings.max ? {max: bindings.max} : {})}
            {...(!!bindings.min ? {max: bindings.min} : {})}
            {...(!!bindings.value ? {value: bindings.value} : {})}
            {...(!!bindings.pattern ? {pattern: bindings.pattern} : {})}
            {...(!!bindings.inputmode ? {placeholder: bindings.inputmode} : {})}
            {...(!!bindings.defaultValue ? {defaultValue: bindings.defaultValue} : {})}
            {...(!!bindings.onChange ? {onChange: bindings.onChange} : {})}
            {...optionalInputAttributes}>
            {
              bindings.options && bindings.kind === "select" &&
              bindings.options.map((option: IOption, index: number) => (
                <option
                  key={index}
                  value={option.id}
                  disabled={option.isDisabled}>
                    {option.name}
                </option>
              ))
            }
          </Tag>
          {
            bindings.kind === "radio" &&
            <div className={Styles.fieldInputRadio}/>
          }
          {
            bindings.kind === "checkbox" &&
            <div className={Styles.fieldInputCheckbox}/>
          }
          {
            bindings.kind === "select" &&
            <Container passedBindings={({
              className: Styles.fieldChevron,
              position: {
                type: "absolute",
                direction: "centerVerticalRight"
              },
              padding: {
                size: "size2",
                direction: "right"
              }
            })}>
            </Container>
          }
        </div>
        {
          bindings.errorTextBindings && bindings.errorTextBindings.text &&
          <Text passedBindings={bindings.errorTextBindings} />
        }
      </div>
    </label>
  )
}
